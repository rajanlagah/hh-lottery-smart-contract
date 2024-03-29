import Head from "next/head";
import { Inter } from "@next/font/google";
import ManualHeader from "@/components/ManualHeader";
import Header from "@/components/Header";
import LotteryEntrance from "@/components/RaffleEntrance";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Smart Contract</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <LotteryEntrance />
    </>
  );
}
