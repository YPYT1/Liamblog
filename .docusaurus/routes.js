import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/about',
    component: ComponentCreator('/about', '8b4'),
    exact: true
  },
  {
    path: '/blog/authors',
    component: ComponentCreator('/blog/authors', '0b7'),
    exact: true
  },
  {
    path: '/friends/',
    component: ComponentCreator('/friends/', 'c78'),
    exact: true
  },
  {
    path: '/guestbook/',
    component: ComponentCreator('/guestbook/', '730'),
    exact: true
  },
  {
    path: '/project/',
    component: ComponentCreator('/project/', '9b6'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', '5de'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'd4d'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '89f'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '8c6'),
            routes: [
              {
                path: '/docs/docusaurus-comment',
                component: ComponentCreator('/docs/docusaurus-comment', '2ca'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/docusaurus-component',
                component: ComponentCreator('/docs/docusaurus-component', '226'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/docusaurus-config',
                component: ComponentCreator('/docs/docusaurus-config', 'c46'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/docusaurus-deploy',
                component: ComponentCreator('/docs/docusaurus-deploy', 'a69'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/docusaurus-guides',
                component: ComponentCreator('/docs/docusaurus-guides', 'da1'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/docusaurus-plugin',
                component: ComponentCreator('/docs/docusaurus-plugin', 'b66'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/docusaurus-search',
                component: ComponentCreator('/docs/docusaurus-search', 'de8'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/docusaurus-style',
                component: ComponentCreator('/docs/docusaurus-style', '7e8'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
