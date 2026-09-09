import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import ActivityModel from '@/models/Activity';
import { Activity } from '@/types';
import { INITIAL_ACTIVITIES } from '@/lib/initialData';
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
    const phaseFilter = searchParams.get('phase');
    const statusFilter = searchParams.get('status');

    const db = await connectToDatabase();
    if (db) {
      const count = await ActivityModel.countDocuments();
      if (count === 0) {
        // Seed initial activities
        const seedData = INITIAL_ACTIVITIES.map((a) => ({
          activityId: a.id,
          phase: a.phase,
          name: a.name,
          start: a.start,
          end: a.end,
          priority: a.priority,
          resp: a.resp,
          dep: a.dep,
          status: a.status,
          pct: a.pct,
          remarks: a.remarks,
        }));
        await ActivityModel.insertMany(seedData);
      }

      // Query filters
      const query: any = {};
      if (phaseFilter && phaseFilter !== 'All Phases') query.phase = phaseFilter;
      if (statusFilter && statusFilter !== 'All Statuses') query.status = statusFilter;

      const totalMatching = await ActivityModel.countDocuments(query);

      let findQuery = ActivityModel.find(query).sort({ activityId: 1 }).lean();

      if (page > 0 && limit > 0) {
        findQuery = findQuery.skip((page - 1) * limit).limit(limit);
      }

      const docs = await findQuery;
      const activities: Activity[] = docs.map((d: any) => ({
        id: d.activityId,
        phase: d.phase,
        name: d.name,
        start: d.start,
        end: d.end,
        priority: d.priority,
        resp: d.resp,
        dep: d.dep,
        status: d.status,
        pct: d.pct,
        remarks: d.remarks,
      }));

      return NextResponse.json({
        success: true,
        data: activities,
        pagination: page > 0 && limit > 0 ? {
          total: totalMatching,
          page,
          limit,
          totalPages: Math.ceil(totalMatching / limit),
        } : undefined,
      });
    }

    // Fallback store
    let allActivities = memoryStore.getActivities();
    if (phaseFilter && phaseFilter !== 'All Phases') {
      allActivities = allActivities.filter((a) => a.phase === phaseFilter);
    }
    if (statusFilter && statusFilter !== 'All Statuses') {
      allActivities = allActivities.filter((a) => a.status === statusFilter);
    }

    if (page > 0 && limit > 0) {
      const startIdx = (page - 1) * limit;
      const paginated = allActivities.slice(startIdx, startIdx + limit);
      return NextResponse.json({
        success: true,
        data: paginated,
        pagination: {
          total: allActivities.length,
          page,
          limit,
          totalPages: Math.ceil(allActivities.length / limit),
        },
      });
    }

    return NextResponse.json({ success: true, data: allActivities });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ success: true, data: memoryStore.getActivities() });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiter
    const ip = getClientIp(req);
    const rl = rateLimit(`mutate-act:${ip}`, 60, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    // 2. RBAC Guard
    const auth = authenticateRequest(req);
    if (auth.authenticated && !authorizeRole(auth.user)) {
      return NextResponse.json({ success: false, error: 'Access Denied: Read-only accounts cannot add activities.' }, { status: 403 });
    }

    // 3. Input Sanitization
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { phase, name, start, end, priority, resp, dep, status, pct, remarks } = body;

    if (!name || !start || !end) {
      return NextResponse.json({ success: false, error: 'Name, Start date, and End date are required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      const maxDoc = await ActivityModel.findOne().sort({ activityId: -1 });
      const nextId = maxDoc ? maxDoc.activityId + 1 : 1;
      const created = await ActivityModel.create({
        activityId: nextId,
        phase: phase || 'Critical Civil & External',
        name,
        start,
        end,
        priority: priority || 'Medium',
        resp: resp || '',
        dep: dep || '',
        status: status || 'Not Started',
        pct: Number(pct) || 0,
        remarks: remarks || '',
      });

      return NextResponse.json({
        success: true,
        data: {
          id: created.activityId,
          phase: created.phase,
          name: created.name,
          start: created.start,
          end: created.end,
          priority: created.priority,
          resp: created.resp,
          dep: created.dep,
          status: created.status,
          pct: created.pct,
          remarks: created.remarks,
        },
      });
    }

    const created = memoryStore.createActivity({
      phase: phase || 'Critical Civil & External',
      name,
      start,
      end,
      priority: priority || 'Medium',
      resp: resp || '',
      dep: dep || '',
      status: status || 'Not Started',
      pct: Number(pct) || 0,
      remarks: remarks || '',
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
    const rl = rateLimit(`mutate-act:${ip}`, 120, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    // 2. RBAC Guard
    const auth = authenticateRequest(req);
    if (auth.authenticated && !authorizeRole(auth.user)) {
      return NextResponse.json({ success: false, error: 'Access Denied: Read-only accounts cannot modify activities.' }, { status: 403 });
    }

    // 3. Input Sanitization
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Activity ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      const updated: any = await ActivityModel.findOneAndUpdate(
        { activityId: id },
        { $set: updates },
        { new: true }
      ).lean();

      if (!updated) {
        return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: updated.activityId,
          phase: updated.phase,
          name: updated.name,
          start: updated.start,
          end: updated.end,
          priority: updated.priority,
          resp: updated.resp,
          dep: updated.dep,
          status: updated.status,
          pct: updated.pct,
          remarks: updated.remarks,
        },
      });
    }

    const updated = memoryStore.updateActivity(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
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
    const rl = rateLimit(`mutate-act:${ip}`, 60, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    // 2. RBAC Guard
    const auth = authenticateRequest(req);
    if (auth.authenticated && !authorizeRole(auth.user)) {
      return NextResponse.json({ success: false, error: 'Access Denied: Read-only accounts cannot delete activities.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ success: false, error: 'Activity ID is required' }, { status: 400 });
    }

    const id = parseInt(idParam, 10);
    const db = await connectToDatabase();
    if (db) {
      const res = await ActivityModel.deleteOne({ activityId: id });
      if (res.deletedCount === 0) {
        return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Activity deleted successfully' });
    }

    const deleted = memoryStore.deleteActivity(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
