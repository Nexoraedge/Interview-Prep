import { getRandomInterviewCover } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import DisplaytechIcons from "./DisplaytechIcons";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async({
  id,
  userId,
  role,
  type,
  techstack,
  level,
  questions,
  finalized,
  createdAt,
}: Interview) => {
   console.log(id , userId)
   const feedback =  id&&userId
   ? await getFeedbackByInterviewId({ interviewId: id   , userId:userId })
   : null;
  console.log(feedback)
  const normalizedtype = /mix/gi.test(type) ? "Mixed" : type;
  const timestamp = feedback?.createdAt || createdAt;
  const dateValue = timestamp?._seconds ? new Date(timestamp._seconds * 1000) : timestamp || Date.now();
  const formattedDate = dayjs(dateValue).format("MMMM D, YYYY");
  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit  px-4 py-2 rounded-bl-lg bg-light-600">
            <p className="badge-text">{normalizedtype}</p>
          </div>
          <Image
            src={getRandomInterviewCover()}
            alt="interview cover"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />
          <h3 className="mt-5 capitalize">{role} Interview</h3>
          <div className="flex  flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2 ">
              <Image
                src="./calendar.svg"
                alt="calendar"
                width={22}
                height={22}
              />
              <p className="">{formattedDate}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src="./star.svg" alt="star" width={22} height={22} />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>
          <p className="line-clamp-2 mt-5">{feedback?.finalAssessment || "You haven't taken the Interview yet. take it now to improve your skills"}</p>
        </div>
        <div className="flex flex-row justify-between">
            <DisplaytechIcons techStack={techstack} />
            <Button className="btn-primary">
            <Link href={feedback?`/interview/${id}/feedback` : `/interview/${id}`}>{feedback?"Check Feedback":"View Interview"}</Link>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
