import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, memoryStore } from '@/lib/db';
import ActivityModel from '@/models/Activity';
import { Activity } from '@/types';
import { sanitizeInput } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { activities } = body;

    if (!Array.isArray(activities)) {
      return NextResponse.json({ success: false, error: 'Activities array is required' }, { status: 400 });
    }

    const resequenced: Activity[] = activities.map((act, idx) => ({
      ...act,
      id: idx + 1,
    }));

    // Update memoryStore
    memoryStore.setActivities(resequenced);

    // Update MongoDB if connected
    const db = await connectToDatabase();
    if (db) {
      // Update each activity's activityId and phase in MongoDB
      const bulkOps = resequenced.map((act) => ({
        updateOne: {
          filter: { name: act.name },
          update: { 
            $set: { 
              activityId: act.id,
              phase: act.phase,
            } 
          },
        },
      }));
      if (bulkOps.length > 0) {
        await ActivityModel.bulkWrite(bulkOps);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Activities successfully reordered and synchronized',
      count: resequenced.length 
    });
  } catch (error: any) {
    console.error('Error in reorder activities API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
