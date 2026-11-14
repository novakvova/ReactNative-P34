using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPISalo.Migrations
{
    /// <inheritdoc />
    public partial class AddChatMessageReadsTabels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tblChatMessageReads",
                columns: table => new
                {
                    MessageId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblChatMessageReads", x => new { x.MessageId, x.UserId });
                    table.ForeignKey(
                        name: "FK_tblChatMessageReads_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tblChatMessageReads_tblChatMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "tblChatMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tblChatMessageReads_UserId",
                table: "tblChatMessageReads",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblChatMessageReads");
        }
    }
}
