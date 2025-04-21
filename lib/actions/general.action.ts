"use server"
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";


export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
    //console.log("userId: ", userId)
    const interviews = await db
        .collection('interviews').where('userid', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}
export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {

    const { userId, limit = 20 } = params

    const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true).where('userid', '!=', userId).orderBy('userid')
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    //console.log("userId: ", id)
    const interview = await db
        .collection('interviews')
        .doc(id)
        .get();

    return interview.data() as Interview | null;
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;
    //console.log("interviewId: ", interviewId);
    //console.log("userId: ", userId);
    //console.log("transcript: ", transcript);
    try {
        const formattedTranscript = transcript.map((sentence: { role: string; content: string }) => (
            `- ${sentence.role}:${sentence.content} \n`
        )).join('');

        const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
            model: google('gemini-2.0-flash-001', {
                structuredOutputs: false,
            }),
            schema: feedbackSchema,
            prompt: `
    You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
    Transcript:
    ${formattedTranscript}

    Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
    - **Communication Skills**: Clarity, articulation, structured responses.
    - **Technical Knowledge**: Understanding of key concepts for the role.
    - **Problem-Solving**: Ability to analyze problems and propose solutions.
    - **Cultural & Role Fit**: Alignment with company values and job role.
    - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
    `,
            system:
                "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
        });
     
       const feedback = await db.collection('feedback').add({
        interviewId,
        userId,
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
        createdAt: new Date(),
       })

       //console.log("Feedback created:", feedback.id);

       return{
        success:true,
        feedbackId:feedback.id,
       }

    } catch (e) {
        //console.log("Error hai createfeedback mien :" + e);
        return{
            success:false,
            feedbackId:null
        }
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback| null> {

    const { interviewId, userId } = params
    //console.log("interviewId:"+interviewId+"\t, UserId:"+userId);
    

    const feedback = await db
        .collection('feedback')
        .where('interviewId', '==', interviewId).where('userId', '==', userId).orderBy('userId')
        .limit(1)
        .get();

        //console.log("Feedback fetched:"+ feedback+"geedback id",interviewId);
;
        if (feedback.empty) {
            return null;
        }
        const feedbackdoc = feedback.docs[0];
        //console.log("feedback doc : ", feedbackdoc);
        return {
            id:feedbackdoc.id , ...feedbackdoc.data()
        }as Feedback;

   
}