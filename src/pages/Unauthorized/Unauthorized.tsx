import ErrorPage from '../ErrorPage';

const Unauthorized = () => {
  return (
    <ErrorPage
      headline="Access unauthorized"
      message="You do not have access to this page."
      description="Please check that you wallet is connected."
    />
  );
};

export default Unauthorized;
