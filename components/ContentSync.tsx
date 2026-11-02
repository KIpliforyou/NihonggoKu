'use client';

import { useEffect } from 'react';
import { getContentVersion, mergeContent } from '@/lib/contentManager';

export default function ContentSync() {
  useEffect(() => {
    async function syncContent() {
      console.log('ContentSync: starting sync');
      try {
        const installedVersion = await getContentVersion();
        const bundledVersion = '1.0.3';
        console.log('ContentSync: installedVersion=', installedVersion, 'bundledVersion=', bundledVersion);

        if (!installedVersion || installedVersion !== bundledVersion) {
          console.log('ContentSync: syncing content...');
          const [bunpouRes, kotobaRes] = await Promise.all([
            fetch('/api/content?type=bunpou&file=data.json'),
            fetch('/api/content?type=kotoba&file=data.json'),
          ]);
          const bunpouData = await bunpouRes.json();
          const kotobaData = await kotobaRes.json();
          const result = await mergeContent({
            manifest: { contentVersion: '1.0.3' },
            bunpou: Array.isArray(bunpouData) ? bunpouData : [],
            kotoba: Array.isArray(kotobaData) ? kotobaData : [],
          });
          console.log('ContentSync: sync complete:', result);
        } else {
          console.log('ContentSync: content already installed');
        }
      } catch (error) {
        console.error('Content sync failed:', error);
      }
    }
    syncContent();
  }, []);

  return null;
}
