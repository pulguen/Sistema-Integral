// src/components/layout/MainLayout/MainLayout.jsx
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAsideLinks } from '../../../context/AsideLinksContext';
import '../../../styles/MainLayout.css';

const MainLayout = ({ children, section }) => {
  const [collapsed, setCollapsed] = useState(false);
  const links = useAsideLinks();
  const asideLinks = links[section] || [];
  const location = useLocation();

  return (
    <Container fluid className={`grid-container${collapsed ? ' aside-collapsed' : ''}`}>
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <span>&gt;</span> : <span>&lt;</span>}
        </button>
        {!collapsed && <h2 className="titulo-slidebar">Menú</h2>}
        <ul>
          {asideLinks.map((link, index) => {
            const isHome = /^\/[^/]+$/.test(link.href);
            const isActive = isHome
              ? location.pathname === link.href
              : (location.pathname === link.href || location.pathname.startsWith(link.href + '/'));
            return (
              <li key={index}>
                <Link
                  to={link.href}
                  className={`nav-link${isActive ? ' active' : ''}${collapsed ? ' icon-only' : ''}`}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={collapsed ? 0 : undefined}
                  title={collapsed ? (typeof link.label === 'string' ? link.label : undefined) : undefined}
                >
                  {typeof link.label === "string"
                    ? link.label
                    : (collapsed
                        ? (link.label.props && Array.isArray(link.label.props.children)
                            ? link.label.props.children[0]
                            : link.label.props.children // Por si es solo un hijo, no un array
                          )
                        : link.label
                      )
                  }
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
      <main className="main-content">{children}</main>
    </Container>
  );
};

export default MainLayout;
