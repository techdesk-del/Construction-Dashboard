import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import MaterialModel from '@/models/Material';
import { MaterialItem } from '@/types';
import { INITIAL_MATERIALS } from '@/lib/initialData';
import { 
  rateLimit, 
  getClientIp, 
  sanitizeInput, 
  authenticateRequest, 
  authorizeRole 
} from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const statusFilter = searchParams.get('status');

    const db = await connectToDatabase();
    if (db) {
      const count = await MaterialModel.countDocuments();
      if (count === 0) {
        // Seed initial materials
        const seedData = INITIAL_MATERIALS.map((m) => ({
          materialId: m.id,
          name: m.name,
          mat: m.mat,
          work: m.work,
          resp: m.resp,
          deadline: m.deadline,
          phase: m.phase || '',
          notes: m.notes || '',
        }));
        await MaterialModel.insertMany(seedData);
      } else {
        // If materials exist but are old generic activity titles, upgrade to genuine farmhouse materials
        const firstDoc = await MaterialModel.findOne({ materialId: 1 });
        if (firstDoc && (firstDoc.name === 'Waterproofing' || firstDoc.name === 'Plaster')) {
          await MaterialModel.deleteMany({});
          const seedData = INITIAL_MATERIALS.map((m) => ({
            materialId: m.id,
            name: m.name,
            mat: m.mat,
            work: m.work,
            resp: m.resp,
            deadline: m.deadline,
            phase: m.phase || '',
            notes: m.notes || '',
          }));
          await MaterialModel.insertMany(seedData);
        }
      }

      const query: any = {};
      if (statusFilter) query.mat = statusFilter;

      const totalMatching = await MaterialModel.countDocuments(query);

      let findQuery = MaterialModel.find(query).sort({ materialId: 1 }).lean();
      if (page > 0 && limit > 0) {
        findQuery = findQuery.skip((page - 1) * limit).limit(limit);
      }

      const docs = await findQuery;
      const materials: MaterialItem[] = docs.map((d: any) => ({
        id: d.materialId,
        name: d.name,
        mat: d.mat,
        work: d.work,
        resp: d.resp,
        deadline: d.deadline,
        phase: d.phase,
        notes: d.notes,
      }));

      return NextResponse.json({
        success: true,
        data: materials,
        pagination: page > 0 && limit > 0 ? {
          total: totalMatching,
          page,
          limit,
          totalPages: Math.ceil(totalMatching / limit),
        } : undefined,
      });
    }

    let allMaterials = memoryStore.getMaterials();
    if (statusFilter) {
      allMaterials = allMaterials.filter((m) => m.mat === statusFilter);
    }

    if (page > 0 && limit > 0) {
      const startIdx = (page - 1) * limit;
      const paginated = allMaterials.slice(startIdx, startIdx + limit);
      return NextResponse.json({
        success: true,
        data: paginated,
        pagination: {
          total: allMaterials.length,
          page,
          limit,
          totalPages: Math.ceil(allMaterials.length / limit),
        },
      });
    }

    return NextResponse.json({ success: true, data: allMaterials });
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ success: true, data: memoryStore.getMaterials() });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiter
    const ip = getClientIp(req);
    const rl = rateLimit(`mutate-mat:${ip}`, 60, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    // 2. RBAC Guard
    const auth = authenticateRequest(req);
    if (auth.authenticated && !authorizeRole(auth.user)) {
      return NextResponse.json({ success: false, error: 'Access Denied: Read-only accounts cannot add materials.' }, { status: 403 });
    }

    // 3. Input Sanitization
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { name, mat, work, resp, deadline, phase, notes } = body;

    if (!name || !deadline) {
      return NextResponse.json({ success: false, error: 'Name and Deadline are required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      const maxDoc = await MaterialModel.findOne().sort({ materialId: -1 });
      const nextId = maxDoc ? maxDoc.materialId + 1 : 1;
      const created = await MaterialModel.create({
        materialId: nextId,
        name,
        mat: mat || 'To be Delivered',
        work: work || 'Pending',
        resp: resp || '',
        deadline,
        phase: phase || '',
        notes: notes || '',
      });

      return NextResponse.json({
        success: true,
        data: {
          id: created.materialId,
          name: created.name,
          mat: created.mat,
          work: created.work,
          resp: created.resp,
          deadline: created.deadline,
          phase: created.phase,
          notes: created.notes,
        },
      });
    }

    const created = memoryStore.createMaterial({
      name,
      mat: mat || 'To be Delivered',
      work: work || 'Pending',
      resp: resp || '',
      deadline,
      phase: phase || '',
      notes: notes || '',
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // 1. Rate Limiter
    const ip = getClientIp(req);
    const rl = rateLimit(`mutate-mat:${ip}`, 120, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    // 2. RBAC Guard
    const auth = authenticateRequest(req);
    if (auth.authenticated && !authorizeRole(auth.user)) {
      return NextResponse.json({ success: false, error: 'Access Denied: Read-only accounts cannot modify materials.' }, { status: 403 });
    }

    // 3. Input Sanitization
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Material ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      const updated: any = await MaterialModel.findOneAndUpdate(
        { materialId: id },
        { $set: updates },
        { new: true }
      ).lean();

      if (!updated) {
        return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: updated.materialId,
          name: updated.name,
          mat: updated.mat,
          work: updated.work,
          resp: updated.resp,
          deadline: updated.deadline,
          phase: updated.phase,
          notes: updated.notes,
        },
      });
    }

    const updated = memoryStore.updateMaterial(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 1. Rate Limiter
    const ip = getClientIp(req);
    const rl = rateLimit(`mutate-mat:${ip}`, 60, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    // 2. RBAC Guard
    const auth = authenticateRequest(req);
    if (auth.authenticated && !authorizeRole(auth.user)) {
      return NextResponse.json({ success: false, error: 'Access Denied: Read-only accounts cannot delete materials.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ success: false, error: 'Material ID is required' }, { status: 400 });
    }

    const id = parseInt(idParam, 10);
    const db = await connectToDatabase();
    if (db) {
      const res = await MaterialModel.deleteOne({ materialId: id });
      if (res.deletedCount === 0) {
        return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Material deleted successfully' });
    }

    const deleted = memoryStore.deleteMaterial(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Material deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
