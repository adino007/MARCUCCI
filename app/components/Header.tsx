import { Await, NavLink } from '@remix-run/react';
import { Suspense } from 'react';
import type { HeaderQuery } from 'storefrontapi.generated';
import type { LayoutProps } from './Layout';
import { useRootLoaderData } from '~/root';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>;

type Viewport = 'desktop' | 'mobile';

export function Header({ header, isLoggedIn, cart }: HeaderProps) {
  const { shop, menu } = header;
  return (
    <header className="header">
      <div className="header-container">
        <NavLink prefetch="intent" to="/" className="header-logo" end>
          <strong>{shop.name}</strong>
        </NavLink>
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
        />
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} menu={menu} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  viewport: Viewport;
}) {
  const { publicStoreDomain } = useRootLoaderData();
  const className = `header-menu-${viewport}`;

  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.href = event.currentTarget.href;
  }

  return (
    <nav className={className} role="navigation">
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        // Check if the viewport is mobile
        if (viewport !== 'mobile') {
          return null; // Skip rendering the NavLink for non-mobile viewports
        }

        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

// HeaderCtas component
function HeaderCtas({
  isLoggedIn,
  cart,
  menu,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'> & { menu: HeaderProps['header']['menu'] }) {
  const { publicStoreDomain } = useRootLoaderData();

  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.href = event.currentTarget.href;
  }

  return (
    <nav className="header-ctas" role="navigation">
      <a className="header-menu-mobile-toggle" href="#mobile-menu-aside" style={{ position: 'absolute', left: 10 }}>
        <h3>☰</h3>
      </a>
      <div id="mobile-menu-aside" className="mobile-menu-aside">
        <nav role="navigation">
          {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
            if (!item.url) return null;

            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain)
                ? new URL(item.url).pathname
                : item.url;

            return (
              <NavLink
                className="side-menu-item"
                end
                key={item.id}
                onClick={closeAside}
                prefetch="intent"
                style={activeLinkStyle}
                to={url}
              >
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        {isLoggedIn ? 'Account' : 'Sign in'}
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}


function SearchToggle() {
  return <a href="#search-aside">Search</a>;
}

function CartBadge({ count }: { count: number }) {
  return <a href="#cart-aside">Cart {count}</a>;
}

function CartToggle({ cart }: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}
