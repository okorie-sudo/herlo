import { UserProfile } from "@/app/profile/page";
import Image from "next/image";
import React from "react";
import { calculateAge } from "@/lib/helpers/calculate-age";

const MatchCard = ({ user }: { user: UserProfile }) => {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="card-swipe aspect-[3/4] overflow-hidden  rounded-2xl">
        <div className="relative w-full h-full">
          <Image
            src={user.avatar_url}
            alt={user.full_name}
            fill
            className={"object-cover transition-opacity duration-400"}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {user.full_name}, {calculateAge(user.birthdate)}
                </h2>
                <p className="text-sm opacity-90 mb-2">@{user.username}</p>
                <p className="text-sm leading-relaxed">{user.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 rotate-12">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
            PASS
          </div>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 -rotate-12">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
            LIKE
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default MatchCard;
