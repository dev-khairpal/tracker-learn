import type { IconName } from './components/layout/Icon.svelte';

export interface NavItem {
	href: string;
	label: string;
	icon: IconName;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
	{
		label: 'Overview',
		items: [{ href: '/', label: 'Dashboard', icon: 'dashboard' }]
	},
	{
		label: 'DSA Practice',
		items: [
			{ href: '/topics', label: 'DSA Topics', icon: 'topics' },
			{ href: '/roadmap', label: 'Interview Roadmap', icon: 'radar' }
		]
	},
	{
		label: 'Interview Prep',
		items: [
			{ href: '/companies', label: 'Company Patterns', icon: 'companies' },
			{ href: '/resources', label: 'Resources', icon: 'resources' }
		]
	}
];
