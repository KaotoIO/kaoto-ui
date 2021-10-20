import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { accessibleRouteChangeHandler } from './utils/utils';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { useDocumentTitle } from './utils/useDocumentTitle';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import { Extension } from './components/Extension';
import { dynamicImport } from './components/import';

const ButtonApp = React.lazy(() => dynamicImport('stepextension', './Button', 'http://localhost:3002/remoteEntry.js'));

let routeFocusTimer: number;

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  routes?: IAppRoute[];
}

export interface IAppRouteGroup {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  path: string;
  title: string;
  label?: string;
  routes?: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    component: Dashboard,
    exact: true,
    label: 'Dashboard',
    path: '/',
    title: 'Zimara | Main Dashboard',
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
};

const RouteWithTitleUpdates = ({
  component: Component,
  isAsync = false,
  title,
  ...rest
}: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} {...rest} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

const AppRoutes = (): React.ReactElement => {
  const onButtonClicked = () => {
    console.log('CLICKED! BANANAS!!');
  };

  return (
    <LastLocationProvider>
      <Switch>
        {flattenedRoutes.map(({ path, exact, component, title, isAsync }, idx) => (
          <RouteWithTitleUpdates
            path={path}
            exact={exact}
            component={component}
            key={idx}
            title={title}
            isAsync={isAsync}
          />
        ))}
        <PageNotFound title="404 Page Not Found" />
      </Switch>
      <Switch>
        <Route exact path="/empty" render={() => <p>Nothing here.</p>} />
        <Route render={() => (
          <section className="extension">
            <Extension name="extension" loading="Loading extension..." failure="Could not load extension. Is it running?">
              <ButtonApp text="Passed from Zimara!" onButtonClicked={onButtonClicked} path="/" />
            </Extension>
          </section>
        )} />
      </Switch>
    </LastLocationProvider>
  )
};

export { AppRoutes, routes };
