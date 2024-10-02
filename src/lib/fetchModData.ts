import yaml from 'js-yaml';

// Modのインターフェース定義
export interface Mod {
  name: string;
  site: { url: string; text: string; icon: string };  // サイトのURL、表示テキスト、アイコンを含むオブジェクト
  stability: string;
  desc: string;
  incomp: string;  // 競合Modリストを文字列として扱う
  client: string;  // クライアントの値は文字列
  server: string;  // サーバーの値も文字列
}

// ChangeModsListのインターフェース定義
interface ChangeModsList {
  minus: string[];  // 削除するModのリスト
  replace: { key: string; changes: Record<string, any> }[];  // 置換するModのリストと変更点
}

// Modデータを読み込み、バージョンごとの変形を行う関数
export async function fetchModData(version: string): Promise<Mod[]> {
    // fetchを使って All_Fabric.yaml を読み込む
    const allModsResponse = await fetch('/lib/All_Fabric.yaml');  // パスを修正
    const allModsYaml = await allModsResponse.text();
    const allMods: Mod[] = yaml.load(allModsYaml) as Mod[];
  
    // fetchを使って change_mods_list.yaml を読み込む
    const changesResponse = await fetch('/lib/change_mods_list.yaml');  // パスを修正
    const changesYaml = await changesResponse.text();
    const changes: Record<string, ChangeModsList> = yaml.load(changesYaml) as Record<string, ChangeModsList>;
  
    // 指定されたバージョンの変更を取得
    const versionChanges = changes[version];
  
    // `minus` に基づいてModを除外
    let filteredMods = allMods.filter(mod => !versionChanges.minus.includes(mod.name));
  
    // `replace` に基づいてModの項目を変更
    for (const { key, changes } of versionChanges.replace) {
      const mod = filteredMods.find(mod => mod.name === key);
      if (mod) {
        Object.assign(mod, changes);  // Modの項目を変更
      }
    }
  
    // 各フィールドを適切に加工して返す
    return filteredMods.map(mod => ({
      ...mod,
      site: formatSite(mod.site as unknown as string),
      incomp: formatIncomp(mod.incomp),
      client: formatClientServer(Number(mod.client)),
      server: formatClientServer(Number(mod.server)),
    }));
  }
  

// サイトのURL、表示テキスト、アイコンを加工する関数
function formatSite(site: string): { url: string; text: string; icon: string } {
  if (site.includes('modrinth.com')) {
    return { url: site, text: 'Modrinth', icon: 'https://modrinth.com/favicon.ico' };
  } else if (site.includes('curseforge.com')) {
    return { url: site, text: 'CurseForge', icon: 'https://static-beta.curseforge.com/images/favicon.ico' };
  } else if (site.includes('github.com')) {
    return { url: site, text: 'GitHub', icon: '/src/static/github-mark-white.png' };
  } else {
    return { url: site, text: 'Unknown', icon: '' };
  }
}

// 競合Modリストを加工する関数
function formatIncomp(incomp: string | string[]): string {
  if (Array.isArray(incomp)) {
    return incomp.length > 1 ? incomp.join(' - <br>') : incomp[0];
  }
  return incomp || '';  // 空の配列やnullに対処
}

// クライアントやサーバーのフィールドを加工する関数
function formatClientServer(value: number): string {
  if (value === 1) {
    return '必要';  // クライアント/サーバーが必須の場合
  } else if (value === 2) {
    return '<h class="option">選択</h>';  // 選択肢の場合
  } else {
    return '';  // それ以外の場合は空文字列
  }
}
