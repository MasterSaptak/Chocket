import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function DELETE(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = await params;
    
    // Optional: Add authorization here to check if caller is superadmin
    // (You'd need to verify an auth token in the headers)
    
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    // 1. Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(uid);
    } catch (authError: any) {
      if (authError.code !== 'auth/user-not-found') {
        throw authError; // throw only if it's a real error, ignore if already gone
      }
    }

    // 2. Delete from Firestore
    await adminDb.collection('users').doc(uid).delete();
    
    return NextResponse.json({ success: true, message: 'User completely deleted from Auth and Database' });
  } catch (error: any) {
    console.error('Failed to fully delete user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
