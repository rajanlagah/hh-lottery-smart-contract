import "@/styles/globals.css";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

export default function App({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <div className="bg-gradient-to-r bg-black h-screen text-white">
          <Component {...pageProps} />
        </div>
      </NotificationProvider>
    </MoralisProvider>
  );
}
