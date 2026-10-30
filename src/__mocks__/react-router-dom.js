const React = require('react');

const mockNavigate = jest.fn();

module.exports = {
  BrowserRouter: ({ children }) => React.createElement('div', { 'data-testid': 'browser-router' }, children),
  Routes: ({ children }) => {
    const childArray = React.Children.toArray(children);
    const indexRoute = childArray.find((c) => c && c.props && c.props.path === '/') || childArray[0];
    return indexRoute && indexRoute.props ? indexRoute.props.element : null;
  },
  Route: () => null,
  Link: ({ to, children, className, ...props }) =>
    React.createElement('a', { href: to, className, ...props }, children),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
};
