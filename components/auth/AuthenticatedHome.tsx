"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CoupleSetup from "@/components/couples/CoupleSetup";
import DateLogApp from "@/components/datelog/DateLogApp";
import {
  createCoupleWithOwner,
  getCoupleById,
  getOwnCoupleMember,
  type Couple,
  type CoupleMember,
} from "@/lib/supabase/couples";
import { createDateLog, getDateLogsByCoupleId } from "@/lib/supabase/dateLogs";
import {
  createInviteCode,
  getActiveInviteByCoupleId,
  joinCoupleByInviteCode,
  type CoupleInvite,
} from "@/lib/supabase/invites";
import { ensureOwnProfile, type Profile } from "@/lib/supabase/profiles";
import { supabase } from "@/lib/supabase/client";
import type { LogEntry } from "@/components/datelog/types";

type SupabaseLikeError = {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
};

function logSupabaseError(label: string, error: SupabaseLikeError | null) {
  console.warn(label, {
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    message: error?.message,
  });
}

export default function AuthenticatedHome() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState("");
  const [userId, setUserId] = useState("");
  const [coupleMember, setCoupleMember] = useState<CoupleMember | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [coupleError, setCoupleError] = useState("");
  const [createCoupleError, setCreateCoupleError] = useState("");
  const [joinInviteError, setJoinInviteError] = useState("");
  const [invite, setInvite] = useState<CoupleInvite | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [dateLogs, setDateLogs] = useState<LogEntry[] | null>(null);
  const [dateLogsError, setDateLogsError] = useState("");

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

      if (memberData) {
        const { data: coupleData, error: coupleFetchError } = await getCoupleById(
          memberData.couple_id,
        );

        if (!active) return;

        if (coupleFetchError) {
          console.error("Couple fetch failed:", coupleFetchError);
          setCoupleError("커플 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          setCouple(coupleData);
          setCoupleError("");
        }

        const { data: inviteData, error: inviteFetchError } =
          await getActiveInviteByCoupleId(memberData.couple_id);

        if (!active) return;

        if (inviteFetchError) {
          console.error("Invite fetch failed:", inviteFetchError);
          setInviteError("초대코드를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          setInvite(inviteData);
          setInviteError("");
        }

        const { data: dateLogsData, error: dateLogsFetchError } =
          await getDateLogsByCoupleId(memberData.couple_id);

        if (!active) return;

        if (dateLogsFetchError) {
          logSupabaseError("Date logs fetch failed", dateLogsFetchError);
          setDateLogs([]);
          setDateLogsError(
            "데이트 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        } else {
          setDateLogs(dateLogsData ?? []);
          setDateLogsError("");
        }
      }

      setIsCheckingSession(false);
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  const loadCoupleContext = async (memberData: CoupleMember) => {
    setCoupleMember(memberData);

    const { data: coupleData, error: coupleFetchError } = await getCoupleById(
      memberData.couple_id,
    );

    if (coupleFetchError) {
      console.error("Couple fetch failed:", coupleFetchError);
      setCoupleError("커플 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      setCouple(coupleData);
      setCoupleError("");
    }

    const { data: inviteData, error: inviteFetchError } =
      await getActiveInviteByCoupleId(memberData.couple_id);

    if (inviteFetchError) {
      console.error("Invite fetch failed:", inviteFetchError);
      setInviteError("초대코드를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      setInvite(inviteData);
      setInviteError("");
    }

    const { data: dateLogsData, error: dateLogsFetchError } =
      await getDateLogsByCoupleId(memberData.couple_id);

    if (dateLogsFetchError) {
      logSupabaseError("Date logs fetch failed", dateLogsFetchError);
      setDateLogs([]);
      setDateLogsError("데이트 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      setDateLogs(dateLogsData ?? []);
      setDateLogsError("");
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleCreateCouple = async (name: string) => {
    if (!userId) return;

    setCreateCoupleError("");
    setJoinInviteError("");
    setCoupleError("");
    const { data: memberData, error: createError } = await createCoupleWithOwner(
      userId,
      name,
    );

    if (createError) {
      logSupabaseError("Couple creation failed", createError);
      setCreateCoupleError("커플 공간을 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (memberData) {
      await loadCoupleContext(memberData);
    }
  };

  const handleJoinByInviteCode = async (code: string) => {
    if (!userId) return;

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setJoinInviteError("초대코드를 입력해주세요.");
      return;
    }

    setCreateCoupleError("");
    setJoinInviteError("");
    const { error: joinError } = await joinCoupleByInviteCode(normalizedCode);

    if (joinError) {
      logSupabaseError("Join couple by invite code failed", joinError);
      setJoinInviteError("초대코드를 확인하지 못했습니다. 코드를 다시 확인해주세요.");
      return;
    }

    const { data: memberData, error: memberFetchError } =
      await getOwnCoupleMember(userId);

    if (memberFetchError || !memberData) {
      logSupabaseError(
        "Couple membership fetch after invite join failed",
        memberFetchError,
      );
      setJoinInviteError("커플 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    await loadCoupleContext(memberData);
  };

  const handleCreateInvite = async () => {
    if (!coupleMember || !userId) return;

    setIsCreatingInvite(true);
    setInviteError("");

    const { data: inviteData, error: inviteCreateError } = await createInviteCode(
      coupleMember.couple_id,
      userId,
    );

    setIsCreatingInvite(false);

    if (inviteCreateError) {
      console.error("Invite creation failed:", inviteCreateError);
      setInviteError("초대코드를 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setInvite(inviteData);
  };

  const handleCreateDateLog = async (input: {
    content: string;
    logDate: string;
    ratingUser1: number;
    ratingUser2: number;
    title: string;
  }) => {
    if (!coupleMember || !userId) {
      return { ok: false };
    }

    const { error: createError } = await createDateLog({
      content: input.content,
      coupleId: coupleMember.couple_id,
      logDate: input.logDate,
      ratingUser1: input.ratingUser1,
      ratingUser2: input.ratingUser2,
      title: input.title,
      userId,
    });

    if (createError) {
      logSupabaseError("Date log creation failed", createError);
      return { ok: false };
    }

    const { data: dateLogsData, error: dateLogsFetchError } =
      await getDateLogsByCoupleId(coupleMember.couple_id);

    if (dateLogsFetchError) {
      logSupabaseError("Date logs refetch after creation failed", dateLogsFetchError);
      setDateLogsError("데이트 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return { ok: false };
    }

    setDateLogs(dateLogsData ?? []);
    setDateLogsError("");
    return { ok: true };
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
        createErrorMessage={createCoupleError || coupleError || profileError}
        displayName={profile?.display_name ?? null}
        isSigningOut={isSigningOut}
        joinErrorMessage={joinInviteError}
        onCreateCouple={handleCreateCouple}
        onJoinByInviteCode={handleJoinByInviteCode}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <DateLogApp
      coupleName={couple?.name ?? null}
      dateLogs={dateLogs ?? []}
      dateLogsError={dateLogsError}
      inviteCode={invite?.code ?? null}
      inviteError={inviteError}
      isCreatingInvite={isCreatingInvite}
      isSigningOut={isSigningOut}
      onCreateDateLog={handleCreateDateLog}
      onCreateInvite={handleCreateInvite}
      onSignOut={handleSignOut}
      profileDisplayName={profile?.display_name ?? null}
      profileError={profileError}
    />
  );
}
