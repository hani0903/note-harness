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
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'init', 'ci'],
    ],
    'subject-case': [0],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'body-min-lines': [2, 'always'],
  },
};
