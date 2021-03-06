import { MESSAGE_MAX_RETRY } from "@gov-libs/constants";
import { AMQPMessage, AMQPQueue } from "@cloudamqp/amqp-client";

type ResponseStatus = "Requeued" | "Discarded";

export async function requeueMessage(
	queue: AMQPQueue,
	message: AMQPMessage
): Promise<ResponseStatus> {
	const retriesCount = Number(message?.properties?.headers?.["x-retries"] ?? 0);

	await message.reject(false);

	if (retriesCount >= MESSAGE_MAX_RETRY) return "Discarded";

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	await queue.publish(message.body!, {
		...message.properties,
		headers: {
			...message.properties.headers,
			"x-retries": retriesCount + 1,
		},
	});

	return "Requeued";
}
