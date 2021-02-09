import * as React from "react";
import { Route, Router } from "react-router-dom";
import * as microsoftTeams from "@microsoft/teams-js";
import { Provider, teamsTheme, teamsDarkTheme, teamsHighContrastTheme, Alert, ThemePrepared, Loader } from "@fluentui/react-northstar";
import { createBrowserHistory } from "history";

// Shared Components
import RouteListener from "./Shared/RouteListener";

// Tab Views
import CommandCenterTab from "./Views/CommandCenterTab";
import Error from "./Views/Error";

// Task Modules
import AddChannelModal from "./Views/AddChannelModal";

// Modal Views
import { AlertHandler, AlertType } from "../Models/AlertHandler";

const browserHistory = createBrowserHistory();

type TeamsTheme = 'default' | 'dark' | 'contrast';

// component properties
export type AppProps = Record<string, never>;

// component state
export interface AppState {
    alert: string;
    alertType: AlertType;
    theme: TeamsTheme;
}

// App component
export default class App extends React.Component<AppProps, AppState> {
    private teamsContext: microsoftTeams.Context;

    constructor(props: AppProps) {
        super(props);
        this.state = {
            alert: null,
            alertType: null,
            theme: "default",
        };

        // initialize Microsoft Teams SDK...required on initial load
        microsoftTeams.initialize();

        // initialize handlers for theme changed and set initial theme
        microsoftTeams.getContext(async (teamsContext: microsoftTeams.Context) => {
            this.teamsContext = teamsContext;
            this.themeChanged(teamsContext.theme);
        });

        microsoftTeams.registerOnThemeChangeHandler(this.themeChanged);
    }

    // handles Teams theme changes
    private themeChanged = (theme: string) => {
        this.setState({ theme: theme as TeamsTheme });
    };

    // fires when then route is changed
    private onRouteChanged = () => {
        // clear out the current error
        this.setState({ alert: null });
    };

    // toggles the alert message
    private onAlert: AlertHandler = (alert, alertType) => {
        this.setState({ alert: alert, alertType: alertType });
    };

    // dismisses the alert message
    private onAlertDismiss = () => {
        this.setState({ alert: null, alertType: null });
    };

    // renders the component
    render(): React.ReactNode {
        // get router details
        const router = (
            <Router history={browserHistory}>
                {this.state.alert && <Alert content={this.state.alert.toString()} danger={this.state.alertType === "danger"} success={this.state.alertType === "success"} warning={this.state.alertType === "warning"} dismissible onVisibleChange={this.onAlertDismiss.bind(this)} />}
                <RouteListener routeChangedHandler={this.onRouteChanged.bind(this)}>
                    {/* Catch-all routes */}
                    <Route exact path="/" render={(props) => <Error {...props} />}/>
                    <Route exact path="/_=_" render={(props) => <Error {...props} />}/>

                    {/* Tab routes */}
                    <Route exact path="/dashboard" render={(props) => <CommandCenterTab alertHandler={this.onAlert.bind(this)} {...props} />}/>
                    <Route exact path="/addchat" render={(props) => <AddChannelModal alertHandler={this.onAlert.bind(this)} {...props} />}/>
                </RouteListener>
            </Router>
        );

        // get provider wrapper based on theme
        const fullDom = (
            <React.Suspense fallback={<Loader />}>
                <Provider theme={this.providerThemeMap[this.state.theme]}>
                    <div className={this.classThemeMap[this.state.theme]}>
                        {router}
                    </div>
                </Provider>
            </React.Suspense>
        );

        return (
            <div className="appWrapper">
                {fullDom}
            </div>
        );
    }

    private readonly providerThemeMap: Record<TeamsTheme, ThemePrepared> = {
        default: teamsTheme,
        dark: teamsDarkTheme,
        contrast: teamsHighContrastTheme,
    };

    private readonly classThemeMap: Record<TeamsTheme, string> = {
        default: 'appDefaultTheme',
        dark: 'appDarkTheme',
        contrast: 'appContrastTheme',
    };
}