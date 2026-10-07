export const toolsNavigation = [
  { id: 'average-salary', label: 'Μέσος συντάξιμος μισθός', footerLabel: 'Υπολογισμός μέσου συντάξιμου μισθού', path: '/average-salary' },
  { id: 'replacement-rate', label: 'Ποσοστό αναπλήρωσης', footerLabel: 'Υπολογισμός ποσοστού αναπλήρωσης', path: '/replacement-rate' },
  { id: 'free-estimation', label: 'Δωρεάν εκτίμηση', footerLabel: 'Δωρεάν Εκτίμηση', path: '/free-estimation' },
];
export const toolPaths = Object.fromEntries(toolsNavigation.map(tool => [tool.id, tool.path]));
// The estimate has its own primary action. Add supporting tools to the registry
// above to include them in both the main menu and the home page.
export const supportingTools = toolsNavigation.filter(tool => tool.id !== 'free-estimation');
export const isAdminPath = pathname => pathname === '/$Sp83199' || pathname.startsWith('/$Sp83199/');
