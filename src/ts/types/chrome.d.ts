/// <reference types="chrome"/>

// 如果上面的引用不起作用，可以使用下面的声明
declare namespace chrome {
  export namespace runtime {
    export function sendMessage(message: any): void;
    export const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: any) => void): void;
    };
  }

  export namespace storage {
    export const local: {
      get(keys: string | string[] | object, callback: (items: object) => void): void;
      set(items: object, callback?: () => void): void;
    };
  }
}

// 为browser API添加声明
declare namespace browser {
  export namespace cookies {
    export function getAll(details: { domain: string }): Promise<{
      name: string;
      value: string;
    }[]>;
  }
}

// 为DownloadItem类型添加声明
declare interface DownloadItem {
  url: string;
  // 添加其他必要的属性
} 