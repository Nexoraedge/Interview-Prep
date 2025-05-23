export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import InterviewCard from "@/components/InterviewCard";
import {
  getCurrentUser,
} from "@/lib/actions/auth.action";
import { getInterviewByUserId, getLatestInterviews } from "@/lib/actions/general.action";



const page = async () => {
  const user = await getCurrentUser();


 const [userInterviews , AllInterviews] = await Promise.all([
   await getInterviewByUserId(user?.id!),
  await getLatestInterviews({userId : user?.id!}),
 ])


  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = AllInterviews?.length > 0;
  


  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get interview ready with AI-Powered practice and feedback</h2>
          <p className="text-lg">
            Practice real time interview questions and get instant feedback.
          </p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src={"/robot.png"}
          alt="robot"
          width={400}
          height={320}
          className="max-sm:hidden"
        />
      </section>
      <section className="flex flex-col gap-6 mt-8 ">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
        {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard key={interview.id}
               userId={user?.id!}
               id={interview.id}
               role={interview.role}
               type={interview.type}
               techstack={interview.techstack}
               createdAt={interview.createdAt} />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
        {hasUpcomingInterviews ? (
            AllInterviews?.map((interview) => (
              <InterviewCard 
              key={interview.id}
               userId={user?.id!}
               id={interview.id}
               role={interview.role}
               type={interview.type}
               createdAt={interview.createdAt}
               techstack={interview.techstack} />
            ))
          ) : (
            <p>No available interviews. Start one now!</p>
          )}
        </div>
      </section>
    </>
  );
};

export default page;
