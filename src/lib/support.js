export const BOARDS = {
  guide: {
    id: 'guide',
    label: '사용법',
    listPath: '/support/guides',
    description: 'DS Platform 사용 방법입니다. 관리자가 글을 올립니다.',
  },
  notice: {
    id: 'notice',
    label: '공지사항',
    listPath: '/support/notices',
    description: '플랫폼 점검·정책·운영 공지입니다.',
  },
}

export function boardMeta(board) {
  return BOARDS[board] || BOARDS.guide
}

export function postPath(post) {
  return `${boardMeta(post.board).listPath}/${post.id}`
}

export function postEditPath(post) {
  return `${boardMeta(post.board).listPath}/${post.id}/edit`
}
