import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import ActivityModel from '@/models/Activity';
import { Activity } from '@/types';
import { INITIAL_ACTIVITIES } from '@/lib/initialData';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const count = await ActivityModel.countDocuments();
      if (count === 0) {
        // Seed initial activities
        const seedData = INITIAL_ACTIVITIES.map(a => ({
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
      const docs = await ActivityModel.find().sort({ activityId: 1 }).lean();
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
      return NextResponse.json({ success: true, data: activities });
    }

    // Fallback store
    return NextResponse.json({ success: true, data: memoryStore.getActivities() });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ success: true, data: memoryStore.getActivities() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    const body = await req.json();
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
