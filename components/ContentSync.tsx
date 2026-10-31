'use client';

import { useEffect } from 'react';
import { getContentVersion, mergeContent } from '@/lib/contentManager';
import manifest from '@/content/manifest.json';
import bunpouData from '@/content/bunpou/data.json';
import kotobaData from '@/content/kotoba/data.json';

export default function ContentSync() {
  useEffect(() => {
    async function syncContent() {
      console.log('ContentSync: starting sync');
      try {
        const installedVersion = await getContentVersion();
        const bundledVersion = manifest.contentVersion;
        console.log('ContentSync: installedVersion=', installedVersion, 'bundledVersion=', bundledVersion);

        if (!installedVersion || installedVersion !== bundledVersion) {
          console.log('ContentSync: syncing content...');
          const result = await mergeContent({
            manifest,
            bunpou: bunpouData as any[],
            kotoba: kotobaData as any[],
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
