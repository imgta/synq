import localFont from 'next/font/local';

export const Metric = localFont({
  variable: '--font-metric',
  display: 'swap',
  src: [
    { path: './metric/metric-thin.woff2', weight: '100', style: 'normal' },
    { path: './metric/metric-thin-italic.woff2', weight: '100', style: 'italic' },
    { path: './metric/metric-light.woff2', weight: '300', style: 'normal' },
    { path: './metric/metric-light-italic.woff2', weight: '300', style: 'italic' },
    { path: './metric/metric-regular.woff2', weight: '400', style: 'normal' },
    { path: './metric/metric-regular-italic.woff2', weight: '400', style: 'italic' },
    { path: './metric/metric-medium.woff2', weight: '500', style: 'normal' },
    { path: './metric/metric-medium-italic.woff2', weight: '500', style: 'italic' },
    { path: './metric/metric-semibold.woff2', weight: '600', style: 'normal' },
    { path: './metric/metric-semibold-italic.woff2', weight: '600', style: 'italic' },
    { path: './metric/metric-bold.woff2', weight: '700', style: 'normal' },
    { path: './metric/metric-bold-italic.woff2', weight: '700', style: 'italic' },
    { path: './metric/metric-black.woff2', weight: '900', style: 'normal' },
    { path: './metric/metric-black-italic.woff2', weight: '900', style: 'italic' },
  ]
});

export const Untitled = localFont({
  variable: '--font-untitled',
  display: 'swap',
  src: [
    { path: './untitled/untitled-sans-light.woff2', weight: '300', style: 'normal' },
    { path: './untitled/untitled-sans-light-italic.woff2', weight: '300', style: 'italic' },
    { path: './untitled/untitled-sans-regular.woff2', weight: '400', style: 'normal' },
    { path: './untitled/untitled-sans-regular-italic.woff2', weight: '400', style: 'italic' },
    { path: './untitled/untitled-sans-medium.woff2', weight: '500', style: 'normal' },
    { path: './untitled/untitled-sans-medium-italic.woff2', weight: '500', style: 'italic' },
    { path: './untitled/untitled-sans-bold.woff2', weight: '700', style: 'normal' },
    { path: './untitled/untitled-sans-bold-italic.woff2', weight: '700', style: 'italic' },
    { path: './untitled/untitled-sans-black.woff2', weight: '900', style: 'normal' },
    { path: './untitled/untitled-sans-black-italic.woff2', weight: '900', style: 'italic' },
  ]
});

export const Soehne = localFont({
  variable: '--font-soehne',
  display: 'swap',
  src: [
    { path: './soehne/soehne-extraleicht.woff2', weight: '200', style: 'normal' },
    { path: './soehne/soehne-extraleicht-kursiv.woff2', weight: '200', style: 'italic' },
    { path: './soehne/soehne-leicht.woff2', weight: '300', style: 'normal' },
    { path: './soehne/soehne-leicht-kursiv.woff2', weight: '300', style: 'italic' },
    { path: './soehne/soehne-buch.woff2', weight: '400', style: 'normal' },
    { path: './soehne/soehne-buch-kursiv.woff2', weight: '400', style: 'italic' },
    { path: './soehne/soehne-kraftig.woff2', weight: '500', style: 'normal' },
    { path: './soehne/soehne-kraftig-kursiv.woff2', weight: '500', style: 'italic' },
    { path: './soehne/soehne-halbfett.woff2', weight: '600', style: 'normal' },
    { path: './soehne/soehne-halbfett-kursiv.woff2', weight: '600', style: 'italic' },
    { path: './soehne/soehne-dreiviertelfett.woff2', weight: '700', style: 'normal' },
    { path: './soehne/soehne-dreiviertelfett-kursiv.woff2', weight: '700', style: 'italic' },
    { path: './soehne/soehne-extrafett.woff2', weight: '900', style: 'normal' },
    { path: './soehne/soehne-extrafett-kursiv.woff2', weight: '900', style: 'italic' },
  ]
});