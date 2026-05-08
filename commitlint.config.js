module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'body-min-lines': ({ body }) => {
          const lines = (body ?? '').split('\n').filter((l) => l.trim()).length;
          return [lines >= 2, '본문은 최소 2줄 이상 작성해야 합니다'];
        },
      },
    },
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'init'],
    ],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'body-min-lines': [2, 'always'],
  },
};
