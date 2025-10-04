// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';

// This function GETS all users (already exists)
export async function GET() {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// This NEW function POSTS a new user to the database
export async function POST(request) {
  try {
    const newUser = await request.json();

    // Basic validation
    if (!newUser || !newUser.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = await db.collection('users').add(newUser);

    return NextResponse.json({ 
      message: 'User created successfully', 
      userId: docRef.id 
    }, { status: 201 });

  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}