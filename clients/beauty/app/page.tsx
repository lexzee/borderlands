"use client";
import LobbyScreen from "@/components/Lobby";
import TestInterface from "@/components/TestInterface";
import Image from "next/image";

export default function Home() {
  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-10 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/* <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"> */}
      <main>
        <LobbyScreen />
        {/* <TestInterface /> */}
      </main>
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <h6 className="font-light text-sm">by Lexzee</h6>
      </footer> */}
    </div>
  );
}
