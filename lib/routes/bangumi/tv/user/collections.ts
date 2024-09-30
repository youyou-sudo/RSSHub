import { Route } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/tv/user/collections/:id/:subject_type?/:type?',
    categories: ['anime'],
    example: '/bangumi/tv/user/collections/sai/1/1',
    parameters: {
        id: '用户 id, 在用户页面地址栏查看',
        subject_type: {
            description: '全部类别: `空`、book: `1`、anime: `2`、music: `3`、game: `4`、real: `6`',
            options: [
                { value: '--', label: '--' },
                { value: 'book', label: '1' },
                { value: 'anime', label: '2' },
                { value: 'music', label: '3' },
                { value: 'game', label: '4' },
                { value: 'real', label: '6' },
            ],
        },
        type: {
            description: '全部类别: `空`、想看: `1`、看过: `2`、在看: `3`、搁置: `4`、抛弃: `5`',
            options: [
                { value: '--', label: '--' },
                { value: '想看', label: '1' },
                { value: '看过', label: '2' },
                { value: '在看', label: '3' },
                { value: '搁置', label: '4' },
                { value: '抛弃', label: '5' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: 'Bangumi 用户收藏列表',
    maintainers: ['honue'],
    handler,
};

async function handler(ctx) {
    const userid = ctx.req.param('id');
    const subject_type = ctx.req.param('subject_type') || '';
    const type = ctx.req.param('type') || '';

    const subjectTypeNames = {
        1: '书籍',
        2: '动画',
        3: '音乐',
        4: '游戏',
        6: '三次元',
    };

    const typeNames = {
        1: '想看',
        2: '看过',
        3: '在看',
        4: '搁置',
        5: '抛弃',
    };

    const typeName = typeNames[type] || '';
    const subjectTypeName = subjectTypeNames[subject_type] || '';

    let listName = '';

    if (typeName && subjectTypeName) {
        listName = `${typeName}的${subjectTypeName}列表`;
    } else if (typeName) {
        listName = `${typeName}的列表`;
    } else if (subjectTypeName) {
        listName = `收藏的${subjectTypeName}列表`;
    } else {
        listName = '的Bangumi收藏列表';
    }

    const userdataurl = `https://api.bgm.tv/v0/users/${userid}`;
    const udata = await got(userdataurl, {
        method: 'get',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const collectionsurl = `https://api.bgm.tv/v0/users/${userid}/collections?subject_type=${subject_type}&type=${type}`;
    const cdata = await got(collectionsurl, {
        method: 'get',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const username = udata.data.nickname;
    const items = cdata.data.data.map((item) => {
        const titles = item.subject.name_cn || item.subject.name;
        const jdate = item.updated_at;
        const subjectid = item.subject_id;

        return {
            title: titles,
            link: `https://bgm.tv/subject/${subjectid}`,
            pubDate: timezone(parseDate(jdate), 0),
            urls: `https://bgm.tv/subject/${subjectid}`,
        };
    });

    return {
        title: `${username}${listName}`,
        link: `https://bgm.tv/user/${userid}/collections`,
        item: items,
        description: `${username}${listName}`,
    };
}
