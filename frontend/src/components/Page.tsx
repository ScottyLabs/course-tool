import React, { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { LoginModal } from "./LoginModal";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { uiSlice } from "../app/ui";
import { Toaster } from "react-hot-toast";

type Props = {
  sidebar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  activePage?: string;
};

export const Page = ({ sidebar, content, footer, activePage }: Props) => {
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const modalShown = useAppSelector(
    (state) => state.ui.session.loginModalShown
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!loggedIn && !modalShown) {
      dispatch(uiSlice.actions.openLoginModal());
    }
  }, [dispatch, loggedIn, modalShown]);

  return (
    <div>
      <LoginModal />
      <Toaster position="bottom-right" />
      <header className="bg-gray-50 fixed inset-x-0 top-0 z-40 h-32 drop-shadow dark:bg-zinc-800 md:h-16">
        <Header activePage={activePage} />
      </header>
      <main className="relative flex flex-col pt-32 md:h-screen md:flex-row md:justify-around md:pt-16">
        {sidebar && <Sidebar>{sidebar}</Sidebar>}
        <div
          className={`flex-1 overflow-y-auto md:h-full ${
            !sidebar && "max-w-7xl"
          }`}
        >
          {content}
        </div>
      </main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
};
