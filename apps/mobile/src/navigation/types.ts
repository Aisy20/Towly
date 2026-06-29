/**
 * Strongly-typed navigation params for the Signal navigation tree.
 *
 * Topology:
 *   RootStack (native stack, above the tab bar)
 *     ├─ Tabs (Map · Pulse · raised Create · Alerts · You)
 *     └─ secondary routes pushed over the tabs
 */
import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabsParamList = {
  Map: undefined;
  Pulse: undefined;
  /** Center raised button — intercepted to push CreateReport; never focused. */
  CreateTab: undefined;
  Alerts: undefined;
  You: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabsParamList> | undefined;
  ReportDetail: { reportId?: string } | undefined;
  CreateReport: undefined;
  DuplicateDetection: { draftId?: string } | undefined;
  Evidence: { reportId?: string } | undefined;
  HelpThread: { reportId?: string } | undefined;
  Settings: undefined;
  Verification: undefined;
  SearchList: undefined;
  ComponentGallery: undefined;
};
