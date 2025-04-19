"use server"

import { auth, db } from "@/firebase/admin";
import {cookies} from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
    const { uid, email, password, name } = params;
    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: "User already exists. Please Sign in instead."
            }
        }
        await db.collection('users').doc(uid).set({
            email,
            name,
            createdAt: new Date()
        })
        return{
            success:true,
            message:"Successfully created account"
        }
    } catch (e: any) {
        console.error("Error creating user:- ", e);
        if (e.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: "Email already exists"
            }
        }
    } 
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord) {
            return {
                success: false,
                message: "User not found. Please Sign up instead."
            }
        }
   await setSessionCookie(idToken);
    } catch (e) {
        console.error("sing-in error", e);
        return {
            success: false,
            message: "Failed to sign in."
        }

    }
    return{
        success:true,
        message:"Successfully signed in"
    }

}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000,

    });
    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    })

}
