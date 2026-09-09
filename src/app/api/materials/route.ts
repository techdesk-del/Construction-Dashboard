import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import MaterialModel from '@/models/Material';
import { MaterialItem } from '@/types';
import { INITIAL_MATERIALS } from '@/lib/initialData';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const count = await MaterialModel.countDocuments();
      if (count === 0) {
        // Seed initial materials
        const seedData = INITIAL_MATERIALS.map(m => ({
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
      const docs = await MaterialModel.find().sort({ materialId: 1 }).lean();
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
      return NextResponse.json({ success: true, data: materials });
    }

    return NextResponse.json({ success: true, data: memoryStore.getMaterials() });
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ success: true, data: memoryStore.getMaterials() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    const body = await req.json();
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
