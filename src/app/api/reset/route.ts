import { NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import ActivityModel from '@/models/Activity';
import MaterialModel from '@/models/Material';
import { INITIAL_ACTIVITIES, INITIAL_MATERIALS } from '@/lib/initialData';

export async function POST() {
  try {
    const db = await connectToDatabase();
    if (db) {
      await ActivityModel.deleteMany({});
      await MaterialModel.deleteMany({});

      const seedActivities = INITIAL_ACTIVITIES.map(a => ({
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

      const seedMaterials = INITIAL_MATERIALS.map(m => ({
        materialId: m.id,
        name: m.name,
        mat: m.mat,
        work: m.work,
        resp: m.resp,
        deadline: m.deadline,
        phase: m.phase || '',
        notes: m.notes || '',
      }));

      await ActivityModel.insertMany(seedActivities);
      await MaterialModel.insertMany(seedMaterials);
    }

    memoryStore.resetToInitial();

    return NextResponse.json({
      success: true,
      message: 'Database reset to blueprint benchmark state successfully',
      data: {
        activities: memoryStore.getActivities(),
        materials: memoryStore.getMaterials(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
