import ErrorPage from '../ErrorPage';

const Forbidden = () => {
  return (
    <ErrorPage
      headline="Access forbidden"
      message="You are not allowed to access this page."
      description="This page has access limited. Please, contact site administrator if this is a mistake."
    />
  );
};

export default Forbidden;
