import dayjs from 'dayjs';
import type { Product } from '@/types/product';

export type PreOrderState = 'open' | 'upcoming' | 'closed';

type PoFields = Pick<Product, 'availability' | 'poMode' | 'poStartAt' | 'poEndAt'>;

/** Whether a pre-order can be bought right now. Ready stock is always "open". */
export function preOrderState(p: PoFields, now = new Date()): PreOrderState {
    if (p.availability !== 'PRE_ORDER' || p.poMode !== 'PERIOD') return 'open';
    if (p.poStartAt && now < new Date(p.poStartAt)) return 'upcoming';
    if (p.poEndAt && now > new Date(p.poEndAt)) return 'closed';
    return 'open';
}

/** Human label for the pre-order window, e.g. "PO 1 Oct – 20 Oct". */
export function preOrderLabel(p: PoFields): string | null {
    if (p.availability !== 'PRE_ORDER') return null;
    if (p.poMode !== 'PERIOD') return 'Pre-order · made per order';
    const fmt = (d: string | null) => (d ? dayjs(d).format('D MMM YYYY, HH:mm') : '?');
    const state = preOrderState(p);
    if (state === 'upcoming') return `Pre-order opens ${fmt(p.poStartAt)}`;
    if (state === 'closed') return `Pre-order closed ${fmt(p.poEndAt)}`;
    return `Pre-order open until ${fmt(p.poEndAt)}`;
}
