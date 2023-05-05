import { PrivacyLevel } from "@cuttinboard-solutions/types-helpers";
import { IBoard } from "@cuttinboard-solutions/types-helpers/dist/board";
import { getUpdateBoardData } from "../src/boards/boardHelpers";

describe("getUpdateBoardData", () => {
  const board: IBoard = {
    id: "123",
    name: "Test Board",
    description: "This is a test board",
    privacyLevel: PrivacyLevel.PUBLIC,
    hosts: [],
    accessTags: [],
    parentId: "abc",
    createdAt: new Date().getTime(),
    refPath: "test/123",
  };

  it("should return the correct data when privacy level is public", () => {
    const updates = {
      name: "New Name",
      description: "New Description",
      position: "New Position",
    };
    const { serverUpdates, localUpdates } = getUpdateBoardData(board, updates);
    expect(serverUpdates).toEqual(updates);
    expect(localUpdates).toEqual({ ...board, ...updates });
  });

  it("should update access tags when privacy level is positions and position is provided", () => {
    const boardWithPositions: IBoard = {
      ...board,
      privacyLevel: PrivacyLevel.POSITIONS,
      hosts: ["abc", "def"],
      parentId: "abc",
      createdAt: new Date().getTime(),
      refPath: "test/123",
    };
    const updates = {
      name: "New Name",
      description: "New Description",
      position: "New Position",
    };
    const { serverUpdates, localUpdates } = getUpdateBoardData(
      boardWithPositions,
      updates
    );
    expect(serverUpdates).toEqual({
      ...updates,
      accessTags: ["hostId_abc", "hostId_def", "New Position"],
    });
    expect(localUpdates).toEqual({
      ...boardWithPositions,
      ...updates,
      accessTags: ["hostId_abc", "hostId_def", "New Position"],
    });
  });

  it("should not update access tags when privacy level is positions but position is not provided", () => {
    const boardWithPositions: IBoard = {
      ...board,
      privacyLevel: PrivacyLevel.POSITIONS,
      hosts: ["abc", "def"],
      parentId: "abc",
      createdAt: new Date().getTime(),
      refPath: "test/123",
    };
    const updates = {
      name: "New Name",
      description: "New Description",
    };
    const { serverUpdates, localUpdates } = getUpdateBoardData(
      boardWithPositions,
      updates
    );
    expect(serverUpdates).toEqual(updates);
    expect(localUpdates).toEqual({
      ...boardWithPositions,
      ...updates,
    });
  });
});
