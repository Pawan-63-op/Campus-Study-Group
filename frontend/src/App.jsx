import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import FriendPage from "./pages/friendPage.jsx";
import AddFriendsPage from "../src/pages/AddFriendsPage.jsx"
import PastRooms from "./pages/PastRooms.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import PasswordResetPage from "./pages/PassWordResetPage.jsx";
import CreateGroupPage from "./pages/CreateGroupPage.jsx";
import AdminGroupsPage from "./pages/AdminGroupsPage.jsx";
import SearchGroupsPage from "./pages/SearchGroupsPage.jsx";
import AddSessionPage from "./pages/AddSessionPage.jsx";
import ViewSessionsPage from "./pages/ViewSessionsPage.jsx";
import ManageChatPage from "../src/pages/ManageChatPage.jsx";
const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isVerified = true;

  if (isLoading) return <PageLoader />;
  console.log(authUser);
  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to={isVerified ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={isVerified ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/friends"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                <FriendPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        {/* /CreateGroup */}
        <Route
          path="/CreateGroup"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                <CreateGroupPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/adminGroups"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                <AdminGroupsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/SearchGroup"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                <SearchGroupsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/AddSessions/:groupId"
          element={
            isAuthenticated ? (
              <Layout showSidebar={true}>
                <AddSessionPage />
              </Layout>
            ) : (<Navigate to="/login" />)
          }
        />

        <Route
          path="/sessions/:groupId"
          element={
            isAuthenticated ? (
              <Layout showSidebar={true}>
                <ViewSessionsPage />
              </Layout>
            ) : (<Navigate to="/login" />)
          }
        />

        <Route
          path="/friends"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                <FriendPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/Room/:id"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={false}>
                <RoomPage />

              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/addFriends"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                <AddFriendsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/roomInvitations"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                {/* <RoomInvitationPage /> */}
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />


        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isVerified ? (
              <ChatPage userId={authUser._id} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/Managechat/:id"
          element={
            isAuthenticated && isVerified ? (
              <ManageChatPage userId={authUser._id} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />



        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isVerified ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/password-reset"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <PasswordResetPage />
            )
          }
        />

      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
