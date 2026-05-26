# 카드 & 리스트

## Divider Prohibition

리스트 항목 사이에 선을 긋지 않는다.

대신 `spacing.4` 간격 기반 구분을 사용한다.

## Hover 상태

```
surface → surface_container_low
```

배경 시프트로만 인터랙션을 표현한다. outline이나 border 추가 금지.

## 카드 배경

- 카드 자체: `surface_container_lowest` (`#ffffff`)
- 카드가 놓이는 섹션: `surface_container`
- 이 두 레이어 차이만으로 리프트 효과를 만든다.

## box-shadow 금지

카드에 `box-shadow`를 적용하지 않는다. Tonal Layering으로 대체한다.
