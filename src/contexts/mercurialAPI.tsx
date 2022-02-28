import { ApolloClient, HttpLink, from, InMemoryCache } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import apolloLogger from 'apollo-link-logger';
import { ApolloProvider } from '@apollo/react-hooks';

interface Props {
  children: JSX.Element;
}

const MERCURIAL_API_URL = process.env.REACT_APP_MERCURIAL_API_URL || 'https://api.mercurial.finance/graphql';

export const MercurialAPIProvider = ({ children }: Props) => {
  const httpLink = new HttpLink({
    uri: MERCURIAL_API_URL,
  });

  const retryLink = new RetryLink({
    delay: {
      initial: 100,
      max: 2000,
      jitter: true,
    },
    attempts: {
      max: 5,
    },
  });

  const additiveLink = from([apolloLogger, retryLink, httpLink]);

  const client = new ApolloClient({
    link: additiveLink,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
