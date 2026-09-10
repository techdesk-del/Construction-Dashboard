import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import ActivityModel from '@/models/Activity';
import MaterialModel from '@/models/Material';
import { sanitizeInput } from '@/lib/security';

export async function PUT(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { oldPhase, newPhase } = body;

    if (!oldPhase || !newPhase) {
      return NextResponse.json(
        { success: false, error: 'Both oldPhase and newPhase are required.' },
        { status: 400 }
      );
    }

    const trimmedOld = String(oldPhase).trim();
    const trimmedNew = String(newPhase).trim();

    if (!trimmedNew) {
      return NextResponse.json(
        { success: false, error: 'New phase title cannot be empty.' },
        { status: 400 }
      );
    }

    // 1. Update in-memory fallback store
    const memResult = memoryStore.renamePhase(trimmedOld, trimmedNew);

    // 2. Update MongoDB if connected
    let mongoUpdatedActs = 0;
    let mongoUpdatedMats = 0;
    const db = await connectToDatabase();
    if (db) {
      const actRes = await ActivityModel.updateMany(
        { phase: trimmedOld },
        { $set: { phase: trimmedNew } }
      );
      mongoUpdatedActs = actRes.modifiedCount || 0;

      const matRes = await MaterialModel.updateMany(
        { phase: trimmedOld },
        { $set: { phase: trimmedNew } }
      );
      mongoUpdatedMats = matRes.modifiedCount || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        oldPhase: trimmedOld,
        newPhase: trimmedNew,
        activitiesUpdated: db ? mongoUpdatedActs : memResult.activitiesUpdated,
        materialsUpdated: db ? mongoUpdatedMats : memResult.materialsUpdated,
      },
    });
  } catch (error: any) {
    console.error('Error renaming phase:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to rename phase.' },
      { status: 500 }
    );
  }
}
