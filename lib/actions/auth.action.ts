"use server"

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";


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
        return {
            success: true,
            message: "Successfully created account"
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
    return {
        success: true,
        message: "Successfully signed in"
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


export async function getCurrentUser(): Promise<User | null> {
    try {
        const cookieStore = await cookies(); // Synchronous
        const sessionCookie =cookieStore.get('session')?.value;
        //console.log("sessionCookie: ", sessionCookie);
        

        if (!sessionCookie) {
            console.warn("No session cookie found");
            return null;
        }

        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        //console.log("Decoded claims:", decodedClaims);
        
        if (!decodedClaims?.uid) {
            console.error("Decoded claims missing uid", decodedClaims);
            return null;
        } 
        if (decodedClaims?.uid) {
            //console.log("Decoded claims uid:", decodedClaims.uid);
        }
        
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
        if (!userRecord.exists) {
            console.warn("User document not found for uid:", decodedClaims.uid);
            return null;
        }

        const userData = userRecord.data();
        if (!userData) {
            console.error("User data is undefined for uid:", decodedClaims.uid);
            return null;
        }

        return {
            ...userData,
            id: decodedClaims.uid
        } as User;
    } catch (e) {
        console.error("Error in getCurrentUser:", e);
        return null;
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}