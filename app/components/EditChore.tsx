import { type Prisma } from "@prisma/client";
import { useState } from "react";
import { Form } from "react-bootstrap";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { DAY, EVERY_DAY, IsDayChecked, TIME_OF_DAY } from "~/utils/days";
import { format } from "date-fns";

type Chore = Prisma.ChoreGetPayload<{}>;
type Person = Prisma.PersonGetPayload<{}>;
export default function EditChore({
  chore,
  people,
}: {
  chore?: Chore;
  people: Person[];
}) {
  const [repeat, setRepeat] = useState(chore?.repeat ?? 0);
  const disabled = chore?.deletedAt != null;

  return (
    <>
      <FloatingLabel controlId="chore.task" label="Task" className="mb-3">
        <Form.Control
          required
          name="task"
          defaultValue={chore?.task}
          disabled={disabled}
        />
      </FloatingLabel>
      <FloatingLabel
        controlId="chore.icon"
        label="Icon"
        className="mb-3"
        placeholder="use an emoji icon"
      >
        <Form.Control
          name="icon"
          defaultValue={chore?.icon}
          disabled={disabled}
        />
      </FloatingLabel>
      <Form.Group className="mb-3" controlId="chore.person">
        <Form.Label>Person</Form.Label>
        {chore == null ? (
          <>
            {people.map((person) => (
              <Form.Check
                key={person.id}
                label={person.name}
                value={person.id}
                name="personId"
                type="checkbox"
                id={`person-checkbox-${person.id}`}
              />
            ))}
          </>
        ) : (
          <input
            type="hidden"
            name="personId"
            value={chore.personId?.toString()}
          />
        )}
      </Form.Group>
      <FloatingLabel
        controlId="chore.pointValue"
        label="Points"
        className="mb-3"
      >
        <Form.Control
          required
          min="1"
          type="number"
          name="pointValue"
          defaultValue={chore?.pointValue ?? 1}
          disabled={disabled}
        />
      </FloatingLabel>
      <Form.Group className="mb-3" controlId="chore.timeOfDay">
        <Form.Label>Time of day</Form.Label>
        <Form.Select
          required
          name="timeOfDay"
          defaultValue={chore?.timeOfDay ?? TIME_OF_DAY.morning}
          disabled={disabled}
        >
          <option value={TIME_OF_DAY.morning}>Morning</option>
          <option value={TIME_OF_DAY.afternoon}>Afternoon</option>
          <option value={TIME_OF_DAY.evening}>Evening</option>
        </Form.Select>
      </Form.Group>
      <FloatingLabel controlId="chore.order" label="Order" className="mb-3">
        <Form.Control
          name="order"
          type="number"
          min="1"
          defaultValue={chore?.order || 1}
          disabled={disabled}
        />
      </FloatingLabel>
      <FloatingLabel
        controlId="chore.startDate"
        label="Start Date (optional)"
        className="mb-3"
      >
        <Form.Control
          name="startDate"
          type="date"
          disabled={disabled}
          defaultValue={
            chore?.startDate
              ? format(Number(chore?.startDate), "yyyy-MM-dd")
              : ""
          }
        />
      </FloatingLabel>
      <FloatingLabel
        controlId="chore.endDate"
        label="End Date (optional)"
        className="mb-3"
      >
        <Form.Control
          name="endDate"
          type="date"
          disabled={disabled}
          defaultValue={
            chore?.endDate ? format(Number(chore?.endDate), "yyyy-MM-dd") : ""
          }
        />
      </FloatingLabel>
      <Form.Group>
        <Form.Label>Days</Form.Label>
        <input type="hidden" name="repeat" value={repeat} />
        <Form.Check
          label="Every Day"
          value={EVERY_DAY}
          checked={repeat === EVERY_DAY}
          id="checkbox-everyday"
          onChange={(e) => setRepeat(e.target.checked ? EVERY_DAY : 0)}
        />
        {Object.entries(DAY).map(([day, value]) => (
          <Form.Check
            key={day}
            label={day}
            value={day}
            checked={IsDayChecked(repeat, value)}
            id={`checkbox-${day}`}
            disabled={disabled}
            onChange={(e) =>
              setRepeat(e.target.checked ? repeat | value : repeat & ~value)
            }
          />
        ))}
      </Form.Group>
    </>
  );
}
