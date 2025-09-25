import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useTaskStore } from '@/lib/store';

export function useAutoSync() {
  const { user } = useUser();
  const { setCurrentUserId, syncFromServer, currentUserId } = useTaskStore();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ユーザーIDを設定
  useEffect(() => {
    if (user?.id && currentUserId !== user.id) {
      setCurrentUserId(user.id);
    }
  }, [user?.id, currentUserId, setCurrentUserId]);

  // 初回同期とリアルタイム同期の設定
  useEffect(() => {
    if (!user?.id) return;

    // 初回同期
    syncFromServer();

    // 30秒ごとにサーバーから同期
    syncIntervalRef.current = setInterval(() => {
      syncFromServer();
    }, 30000); // 30秒

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [user?.id, syncFromServer]);

  // ページの可視性が変わった時の同期
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // ページが再表示された時に同期
        syncFromServer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, syncFromServer]);

  // ウィンドウがフォーカスされた時の同期
  useEffect(() => {
    if (!user?.id) return;

    const handleFocus = () => {
      syncFromServer();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id, syncFromServer]);
}

export default useAutoSync;
