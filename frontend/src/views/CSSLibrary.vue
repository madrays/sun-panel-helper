<style>
/* 卡片悬停动画的预览效果 */
.widgets-container .widget-card[data-widget-id="cardHover"] .item-card {
  transform-origin: center center;
  animation: 
    previewScale 4s infinite,
    previewShake 4s 0.2s infinite ease-in-out;
}

@keyframes previewScale {
  0%, 100% {
    transform: scale(1);
  }
  5%, 25% {
    transform: scale(1.05);
  }
  30% {
    transform: scale(1);
  }
}

@keyframes previewShake {
  0%, 100% {
    transform: scale(1) rotate(0);
  }
  5% {
    transform: scale(1.05) rotate(0);
  }
  10% {
    transform: scale(1.05) rotate(10deg);
  }
  15% {
    transform: scale(1.05) rotate(-10deg);
  }
  20% {
    transform: scale(1.05) rotate(2.5deg);
  }
  25% {
    transform: scale(1.05) rotate(-2.5deg);
  }
  30% {
    transform: scale(1) rotate(0);
  }
}
</style> 