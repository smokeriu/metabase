import cx from "classnames";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t } from "ttag";

/* eslint-disable-next-line no-restricted-imports -- deprecated sdk import */
import { useInteractiveDashboardContext } from "embedding-sdk/components/public/InteractiveDashboard/context";
import { isInstanceAnalyticsCollection } from "metabase/collections/utils";
import EditBar from "metabase/common/components/EditBar";
import EditableText from "metabase/common/components/EditableText";
import LastEditInfoLabel from "metabase/common/components/LastEditInfoLabel";
import CS from "metabase/css/core/index.css";
import {
  applyDraftParameterValues,
  resetParameters,
  updateDashboard,
} from "metabase/dashboard/actions";
import { useSetDashboardAttributeHandler } from "metabase/dashboard/components/Dashboard/use-set-dashboard-attribute";
import { DashboardHeaderButtonRow } from "metabase/dashboard/components/DashboardHeader/DashboardHeaderButtonRow/DashboardHeaderButtonRow";
import { DashboardTabs } from "metabase/dashboard/components/DashboardTabs";
import {
  getCanResetFilters,
  getIsEditing,
  getIsHeaderVisible,
  getIsShowDashboardInfoSidebar,
  getIsShowDashboardSettingsSidebar,
  getIsSidebarOpen,
} from "metabase/dashboard/selectors";
import type {
  DashboardFullscreenControls,
  DashboardNightModeControls,
  DashboardRefreshPeriodControls,
} from "metabase/dashboard/types";
import { color } from "metabase/lib/colors";
import { useDispatch, useSelector } from "metabase/lib/redux";
import {
  PLUGIN_COLLECTION_COMPONENTS,
  PLUGIN_MODERATION,
} from "metabase/plugins";
import { getIsNavbarOpen } from "metabase/selectors/app";
import { FullWidthContainer } from "metabase/styled-components/layout/FullWidthContainer";
import { Box, Flex } from "metabase/ui";
import type { Collection, Dashboard } from "metabase-types/api";

import { FixedWidthContainer } from "../Dashboard/DashboardComponents";
import { SIDEBAR_WIDTH } from "../Sidebar";

import S from "./DashboardHeaderView.module.css";

type DashboardHeaderViewProps = {
  editingTitle?: string;
  editingButtons?: JSX.Element[];
  editWarning?: string;
  dashboard: Dashboard;
  collection: Collection;
  isBadgeVisible: boolean;
  isLastEditInfoVisible: boolean;
  onLastEditInfoClick?: () => void;
} & DashboardFullscreenControls &
  DashboardRefreshPeriodControls &
  DashboardNightModeControls;

export function DashboardHeaderView({
  editingTitle = "",
  editingButtons = [],
  editWarning,
  dashboard,
  collection,
  isLastEditInfoVisible,
  onLastEditInfoClick,
  refreshPeriod,
  onRefreshPeriodChange,
  setRefreshElapsedHook,
  isFullscreen,
  onFullscreenChange,
  isNightMode,
  onNightModeChange,
  hasNightModeToggle,
}: DashboardHeaderViewProps) {
  const isNavBarOpen = useSelector(getIsNavbarOpen);
  const isEditing = useSelector(getIsEditing);

  const setDashboardAttribute = useSetDashboardAttributeHandler();
  const [showSubHeader, setShowSubHeader] = useState(true);
  const header = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const canResetFilters = useSelector(getCanResetFilters);
  const isSidebarOpen = useSelector(getIsSidebarOpen);
  const isInfoSidebarOpen = useSelector(getIsShowDashboardInfoSidebar);
  const isSettingsSidebarOpen = useSelector(getIsShowDashboardSettingsSidebar);

  const isDashboardHeaderVisible = useSelector(getIsHeaderVisible);
  const isAnalyticsDashboard = isInstanceAnalyticsCollection(collection);

  const handleResetFilters = useCallback(async () => {
    await dispatch(resetParameters());
    await dispatch(applyDraftParameterValues());
  }, [dispatch]);

  const { dashboardActions } = useInteractiveDashboardContext();

  const _headerButtons = useMemo(
    () => (
      <Flex
        className={cx("Header-buttonSection", S.HeaderButtonSection, {
          [S.isNavBarOpen]: isNavBarOpen,
        })}
      >
        <DashboardHeaderButtonRow
          canResetFilters={canResetFilters}
          onResetFilters={handleResetFilters}
          dashboardActionKeys={dashboardActions}
          refreshPeriod={refreshPeriod}
          onRefreshPeriodChange={onRefreshPeriodChange}
          setRefreshElapsedHook={setRefreshElapsedHook}
          isFullscreen={isFullscreen}
          onFullscreenChange={onFullscreenChange}
          isNightMode={isNightMode}
          onNightModeChange={onNightModeChange}
          hasNightModeToggle={hasNightModeToggle}
          isAnalyticsDashboard={isAnalyticsDashboard}
        />
      </Flex>
    ),
    [
      canResetFilters,
      handleResetFilters,
      dashboardActions,
      hasNightModeToggle,
      isAnalyticsDashboard,
      isFullscreen,
      isNavBarOpen,
      isNightMode,
      onFullscreenChange,
      onNightModeChange,
      onRefreshPeriodChange,
      refreshPeriod,
      setRefreshElapsedHook,
    ],
  );

  const handleUpdateCaption = useCallback(
    async (name: string) => {
      await setDashboardAttribute("name", name);
      if (!isEditing) {
        await dispatch(updateDashboard({ attributeNames: ["name"] }));
      }
    },
    [setDashboardAttribute, isEditing, dispatch],
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (isLastEditInfoVisible) {
        setShowSubHeader(false);
      }
    }, 4000);
    return () => clearTimeout(timerId);
  }, [isLastEditInfoVisible]);

  return (
    <div>
      {isEditing && <EditBar title={editingTitle} buttons={editingButtons} />}
      {editWarning && (
        <Flex className={cx(CS.wrapper, S.EditWarning)}>
          <span>{editWarning}</span>
        </Flex>
      )}
      <div
        className={cx(S.HeaderContainer, {
          [S.isFixedWidth]: dashboard?.width === "fixed",
          [S.offsetSidebar]:
            isSidebarOpen && !isInfoSidebarOpen && !isSettingsSidebarOpen,
        })}
        style={
          {
            "--sidebar-width": `${SIDEBAR_WIDTH}px`,
          } as React.CSSProperties
        }
      >
        {isDashboardHeaderVisible && (
          <FullWidthContainer
            className={cx(CS.wrapper, S.HeaderRow)}
            data-testid="dashboard-header"
            ref={header}
          >
            <FixedWidthContainer
              className={cx(S.HeaderFixedWidthContainer, {
                [S.isNavBarOpen]: isNavBarOpen,
              })}
              data-testid="fixed-width-dashboard-header"
              isFixedWidth={dashboard?.width === "fixed"}
            >
              <Box
                role="heading"
                className={cx(S.HeaderContent, {
                  [S.showSubHeader]: showSubHeader,
                })}
              >
                <Flex className={S.HeaderCaptionContainer}>
                  <EditableText
                    className={S.HeaderCaption}
                    key={dashboard.name}
                    initialValue={dashboard.name}
                    placeholder={t`Add title`}
                    isDisabled={!dashboard.can_write}
                    data-testid="dashboard-name-heading"
                    onChange={handleUpdateCaption}
                    maxLength={100}
                  />
                  <PLUGIN_MODERATION.EntityModerationIcon
                    dashboard={dashboard}
                  />
                  <PLUGIN_COLLECTION_COMPONENTS.CollectionInstanceAnalyticsIcon
                    color={color("brand")}
                    collection={collection}
                    entity="dashboard"
                  />
                </Flex>
                <Flex className={S.HeaderBadges}>
                  {isLastEditInfoVisible && (
                    <LastEditInfoLabel
                      className={S.HeaderLastEditInfoLabel}
                      item={dashboard}
                      onClick={onLastEditInfoClick}
                    />
                  )}
                </Flex>
              </Box>

              <Flex
                className={cx(S.HeaderButtonsContainer, {
                  [S.isNavBarOpen]: isNavBarOpen,
                })}
              >
                {_headerButtons}
              </Flex>
            </FixedWidthContainer>
          </FullWidthContainer>
        )}
        <FullWidthContainer className={S.HeaderRow}>
          <FixedWidthContainer
            className={cx(S.HeaderFixedWidthContainer, {
              [S.isNavBarOpen]: isNavBarOpen,
            })}
            data-testid="fixed-width-dashboard-tabs"
            isFixedWidth={dashboard?.width === "fixed"}
          >
            <DashboardTabs />
          </FixedWidthContainer>
        </FullWidthContainer>
      </div>
    </div>
  );
}
