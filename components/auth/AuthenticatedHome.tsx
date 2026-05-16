"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CoupleSetup from "@/components/couples/CoupleSetup";
import DateLogApp from "@/components/datelog/DateLogApp";
import {
  createCoupleWithOwner,
  getOwnCoupleMember,
  type CoupleMember,
} from "@/lib/supabase/couples";
import { ensureOwnProfile, type Profile } from "@/lib/supabase/profiles";
import { supabase } from "@/lib/supabase/client";

export default function AuthenticatedHome() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState("");
  const [userId, setUserId] = useState("");
  const [coupleMember, setCoupleMember] = useState<CoupleMember | null>(null);
  const [coupleError, setCoupleError] = useState("");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);

      const { data: profileData, error: profileFetchError } =
        await ensureOwnProfile(session.user);

      if (!active) return;

      if (profileFetchError) {
        console.error("Profile ensure failed:", profileFetchError);
        setProfileError("프로필을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setProfile(profileData);
        setProfileError("");
      }

      const { data: memberData, error: memberFetchError } =
        await getOwnCoupleMember(session.user.id);

      if (!active) return;

      if (memberFetchError) {
        console.error("Couple membership fetch failed:", memberFetchError);
        setCoupleError("커플 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setCoupleMember(memberData);
        setCoupleError("");
      }

      setIsCheckingSession(false);
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleCreateCouple = async (name: string) => {
    if (!userId) return;

    setCoupleError("");
    const { data: memberData, error: createError } = await createCoupleWithOwner(
      userId,
      name,
    );

    if (createError) {
      console.error("Couple creation failed:", createError);
      setCoupleError("커플 공간을 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setCoupleMember(memberData);
  };

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7fb] px-4 text-[#3f2d37]">
        <div className="rounded-3xl bg-white px-6 py-5 text-center shadow-xl">
          <p className="text-lg text-[var(--datelog-theme)]">
            로그인 상태를 확인하고 있습니다...
          </p>
        </div>
      </main>
    );
  }

  if (!coupleMember) {
    return (
      <CoupleSetup
        displayName={profile?.display_name ?? null}
        errorMessage={coupleError || profileError}
        isSigningOut={isSigningOut}
        onCreateCouple={handleCreateCouple}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <DateLogApp
      isSigningOut={isSigningOut}
      onSignOut={handleSignOut}
      profileDisplayName={profile?.display_name ?? null}
      profileError={profileError}
    />
  );
}
