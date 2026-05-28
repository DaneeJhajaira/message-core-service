export function resolveInboundMessageBody(
  messageType: string,
  body: string | null | undefined,
  rawPayload: Record<string, unknown> | null | undefined,
): string | null {
  if (body) {
    return body;
  }

  if (!rawPayload) {
    return null;
  }

  if (messageType === 'button') {
    const button = rawPayload.button as
      | { text?: string; payload?: string }
      | undefined;
    return button?.text ?? button?.payload ?? null;
  }

  if (messageType === 'interactive') {
    const interactive = rawPayload.interactive as
      | {
          button_reply?: { title?: string };
          list_reply?: { title?: string; description?: string };
        }
      | undefined;

    return (
      interactive?.button_reply?.title ??
      interactive?.list_reply?.title ??
      interactive?.list_reply?.description ??
      null
    );
  }

  return null;
}

export function isInteractiveReplyMessageType(messageType: string): boolean {
  return messageType === 'button' || messageType === 'interactive';
}
