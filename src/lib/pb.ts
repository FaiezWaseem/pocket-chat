import { POCKET_ENDPOINT } from '@/contants';
import PocketBase from 'pocketbase';
const pb = new PocketBase(POCKET_ENDPOINT);

export default pb;