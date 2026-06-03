import { Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/Shell'
import SpaceShell from './components/SpaceShell'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

import Body from './pages/Body'
import Mind from './pages/Mind'
import LifeApps from './pages/LifeApps'
import World from './pages/World'
import Platform from './pages/Platform'

import Planner from './pages/Planner'
import Scheduler from './pages/Scheduler'
import Journal from './pages/Journal'
import Fitness from './pages/Fitness'
import Health from './pages/Health'
import Financial from './pages/Financial'
import Diet from './pages/Diet'
import Contacts from './pages/Contacts'
import Brain from './pages/Brain'
import AroundTown from './pages/AroundTown'
import Lists from './pages/Lists'
import Draft from './pages/Draft'
import Agreements from './pages/Agreements'
import Posthumous from './pages/Posthumous'
import Research from './pages/Research'
import Media from './pages/Media'
import Learning from './pages/Learning'
import LifeSuite from './pages/LifeSuite'
import Space from './pages/Space'
import SpaceFeed from './pages/SpaceFeed'
import SpaceConnections from './pages/SpaceConnections'
import SpaceMessages from './pages/SpaceMessages'
import SpaceNotifications from './pages/SpaceNotifications'
import SpaceGroups from './pages/SpaceGroups'
import SpaceCustomize from './pages/SpaceCustomize'
import SpaceEditor from './pages/SpaceEditor'
import SpaceCreate from './pages/SpaceCreate'
import SpaceSetup from './pages/SpaceSetup'
import Dash from './pages/Dash'
import Agora from './pages/Agora'
import TradingPost from './pages/TradingPost'
import MailingJoin from './pages/MailingJoin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dash" element={<Dash />} />
      <Route path="/dashboard" element={<Navigate to="/dash" replace />} />
      <Route path="/platform" element={<Platform />} />
      <Route path="/agora" element={<Agora />} />
      <Route path="/store" element={<TradingPost />} />
      <Route element={<Shell />}>
        <Route path="/autogenes" element={<Navigate to="/dash" replace />} />
        <Route path="/autogenes/body" element={<Body />} />
        <Route path="/autogenes/mind" element={<Mind />} />
        <Route path="/autogenes/money" element={<LifeApps />} />
        <Route path="/autogenes/world" element={<World />} />
        <Route path="/autogenes/brain" element={<Brain />} />

        {/* Redirect old flat routes into their pillar */}
        <Route path="/autogenes/fitness"    element={<Navigate to="/autogenes/body?tab=fitness" replace />} />
        <Route path="/autogenes/health"     element={<Navigate to="/autogenes/body?tab=health" replace />} />
        <Route path="/autogenes/diet"       element={<Navigate to="/autogenes/body?tab=diet" replace />} />
        <Route path="/autogenes/planner"      element={<Navigate to="/autogenes/mind?tab=planner" replace />} />
        <Route path="/autogenes/goals"        element={<Navigate to="/autogenes/mind?tab=goals" replace />} />
        <Route path="/autogenes/plans"        element={<Navigate to="/autogenes/mind?tab=plans" replace />} />
        <Route path="/autogenes/routines"     element={<Navigate to="/autogenes/mind?tab=routines" replace />} />
        <Route path="/autogenes/achievements" element={<Navigate to="/autogenes/mind?tab=achievements" replace />} />
        <Route path="/autogenes/kenoma"       element={<Navigate to="/autogenes/mind?tab=habits" replace />} />
        <Route path="/autogenes/habits"       element={<Navigate to="/autogenes/mind?tab=habits" replace />} />
        <Route path="/autogenes/scheduler"    element={<Navigate to="/autogenes/mind?tab=schedule" replace />} />
        <Route path="/autogenes/journal"      element={<Navigate to="/autogenes/mind?tab=journal" replace />} />
        <Route path="/autogenes/learning"     element={<Navigate to="/autogenes/mind?tab=learning" replace />} />
        <Route path="/autogenes/jokes"        element={<Navigate to="/autogenes/mind?tab=jokes" replace />} />
        <Route path="/autogenes/financial"  element={<Navigate to="/autogenes/money?tab=financial" replace />} />
        <Route path="/autogenes/lists"      element={<Navigate to="/autogenes/money?tab=lists" replace />} />
        <Route path="/autogenes/agreements" element={<Navigate to="/autogenes/money?tab=agreements" replace />} />
        <Route path="/autogenes/research"   element={<Navigate to="/autogenes/money?tab=research" replace />} />
        <Route path="/autogenes/contacts"   element={<Navigate to="/autogenes/world?tab=contacts" replace />} />
        <Route path="/autogenes/media"      element={<Navigate to="/autogenes/world?tab=media" replace />} />
        <Route path="/autogenes/aroundtown" element={<Navigate to="/autogenes/world?tab=aroundtown" replace />} />
        <Route path="/autogenes/posthumous" element={<Navigate to="/autogenes/world?tab=posthumous" replace />} />
        <Route path="/autogenes/draft"      element={<Navigate to="/autogenes/world?tab=draft" replace />} />
        <Route path="/autogenes/travel"     element={<Navigate to="/autogenes/money?tab=lists" replace />} />
        <Route path="/autogenes/lens"       element={<Navigate to="/autogenes/brain" replace />} />
        <Route path="/autogenes/groups"     element={<Navigate to="/autogenes/world?tab=contacts" replace />} />

        {/* Back-compat: old /life/* routes → /autogenes/* */}
        <Route path="/life" element={<Navigate to="/autogenes" replace />} />
        <Route path="/life/body" element={<Navigate to="/autogenes/body" replace />} />
        <Route path="/life/mind" element={<Navigate to="/autogenes/mind" replace />} />
        <Route path="/life/money" element={<Navigate to="/autogenes/money" replace />} />
        <Route path="/life/world" element={<Navigate to="/autogenes/world" replace />} />
        <Route path="/life/brain" element={<Navigate to="/autogenes/brain" replace />} />
        <Route path="/life/fitness"    element={<Navigate to="/autogenes/body?tab=fitness" replace />} />
        <Route path="/life/health"     element={<Navigate to="/autogenes/body?tab=health" replace />} />
        <Route path="/life/diet"       element={<Navigate to="/autogenes/body?tab=diet" replace />} />
        <Route path="/life/planner"    element={<Navigate to="/autogenes/mind?tab=planner" replace />} />
        <Route path="/life/scheduler"  element={<Navigate to="/autogenes/mind?tab=scheduler" replace />} />
        <Route path="/life/journal"    element={<Navigate to="/autogenes/mind?tab=journal" replace />} />
        <Route path="/life/learning"   element={<Navigate to="/autogenes/mind?tab=learning" replace />} />
        <Route path="/life/financial"  element={<Navigate to="/autogenes/money?tab=financial" replace />} />
        <Route path="/life/lists"      element={<Navigate to="/autogenes/money?tab=lists" replace />} />
        <Route path="/life/agreements" element={<Navigate to="/autogenes/money?tab=agreements" replace />} />
        <Route path="/life/research"   element={<Navigate to="/autogenes/money?tab=research" replace />} />
        <Route path="/life/contacts"   element={<Navigate to="/autogenes/world?tab=contacts" replace />} />
        <Route path="/life/media"      element={<Navigate to="/autogenes/world?tab=media" replace />} />
        <Route path="/life/aroundtown" element={<Navigate to="/autogenes/world?tab=aroundtown" replace />} />
        <Route path="/life/posthumous" element={<Navigate to="/autogenes/world?tab=posthumous" replace />} />
        <Route path="/life/draft"      element={<Navigate to="/autogenes/world?tab=draft" replace />} />
        <Route path="/life/travel"     element={<Navigate to="/autogenes/money?tab=lists" replace />} />
        <Route path="/life/lens"       element={<Navigate to="/autogenes/brain" replace />} />
        <Route path="/life/groups"     element={<Navigate to="/autogenes/world?tab=contacts" replace />} />

        <Route path="/lifesuite" element={<LifeSuite />} />
        <Route path="/legacy/dashboard" element={<Dashboard />} />
      </Route>
      <Route element={<SpaceShell />}>
        <Route path="/monogenes" element={<Space />} />
        <Route path="/monogenes/feed" element={<SpaceFeed />} />
        <Route path="/monogenes/connections" element={<SpaceConnections />} />
        <Route path="/monogenes/messages" element={<SpaceMessages />} />
        <Route path="/monogenes/notifications" element={<SpaceNotifications />} />
        <Route path="/monogenes/groups" element={<SpaceGroups />} />
        {/* Back-compat: old /space/* routes → /monogenes/* */}
        <Route path="/space" element={<Navigate to="/monogenes" replace />} />
        <Route path="/space/feed" element={<Navigate to="/monogenes/feed" replace />} />
        <Route path="/space/connections" element={<Navigate to="/monogenes/connections" replace />} />
        <Route path="/space/messages" element={<Navigate to="/monogenes/messages" replace />} />
        <Route path="/space/notifications" element={<Navigate to="/monogenes/notifications" replace />} />
        <Route path="/space/groups" element={<Navigate to="/monogenes/groups" replace />} />
      </Route>
      <Route path="/monogenes/customize" element={<SpaceCustomize />} />
      <Route path="/monogenes/editor" element={<SpaceEditor />} />
      <Route path="/monogenes/setup" element={<SpaceSetup />} />
      <Route path="/barbelo/create" element={<SpaceCreate />} />
      {/* Back-compat: old standalone space routes */}
      <Route path="/space/customize" element={<Navigate to="/monogenes/customize" replace />} />
      <Route path="/space/editor" element={<Navigate to="/monogenes/editor" replace />} />
      <Route path="/space/create" element={<Navigate to="/barbelo/create" replace />} />
      <Route path="/autogenes/join/:slug" element={<MailingJoin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
